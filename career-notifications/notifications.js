// IndexDB instance
let db;

const notificationNotice = document.getElementById("notification-state");
const notifyButton = document.getElementById("notify-button");
const noticeBox = document.getElementById("notice-box");

// Schema for the database
let newCareer = [
    {
        careerIndex: 6, // Should be unique
        careerName: "WordPress Engineer",
        careerDescription:
            "We are hiring for a WordPress Engineer with a prior experience in WordPress.",
        careerUrl: "https://rtcamp.com/careers/senior-wordpress-engineer/",
        notified: "no",
    },
];

// Check if notification are enabled
if ("granted" === Notification.permission) {
    console.log("Notifications are enabled");
    notificationNotice.classList.add("d-none");
}

window.onload = function () {
    // Add notice to notice box that app is initialized
    noticeBox.innerHTML = "<li>App is initialized</li>";

    // @see https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#using_an_experimental_version_of_indexeddb
    // In the following line, you should include the prefixes of implementations you want to test.
    window.indexedDB =
        window.indexedDB ||
        window.mozIndexedDB ||
        window.webkitIndexedDB ||
        window.msIndexedDB;
    // DON'T use "var indexedDB = ..." if you're not in a function.
    // Moreover, you may need references to some window.IDB* objects:
    window.IDBTransaction = window.IDBTransaction ||
        window.webkitIDBTransaction ||
        window.msIDBTransaction || { READ_WRITE: "readwrite" }; // This line should only be needed if it is needed to support the object's constants for older browsers
    window.IDBKeyRange =
        window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

    if (!window.indexedDB) {
        console.error(
            "Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available."
        );
    }

    const openIndexDB = window.indexedDB.open("careerNotifications", 4);

    openIndexDB.onerror = function (event) {
        console.log(event.target.errorCode);
    };

    openIndexDB.onsuccess = function (event) {
        noticeBox.innerHTML += "<li>IndexedDB is initialized</li>";
        // assign result to global db variable
        db = openIndexDB.result;
        addData();
    };

    openIndexDB.onupgradeneeded = function (event) {
        let db = event.target.result;

        db.onerror = (event) => {
            noticeBox.innerHTML +=
                "<li>Error loading database: " +
                event.target.errorCode +
                "</li>";
        };

        // create an objectStore for this database
        let objectStore = db.createObjectStore("careerNotifications", {
            keyPath: "careerIndex",
        });

        objectStore.createIndex("careerName", "careerName", { unique: false });
        objectStore.createIndex("careerDescription", "careerDescription", {
            unique: false,
        });
        objectStore.createIndex("careerUrl", "careerUrl", { unique: false });
        objectStore.createIndex("notified", "notified", { unique: false });

        noticeBox.innerHTML += "<li>ObjectStore is initialized</li>";
    };

    function addData() {
        let transaction = db.transaction(["careerNotifications"], "readwrite");
        let objectStore = transaction.objectStore("careerNotifications");
        let request = objectStore.add(newCareer[0]);
        request.onsuccess = function (event) {
            noticeBox.innerHTML += "<li>Data is added</li>";
            createNotification(
                newCareer[0].careerName,
                newCareer[0].careerDescription,
                newCareer[0].careerUrl
            );
        };
        request.onerror = function (event) {
            noticeBox.innerHTML +=
                "<li>Error adding data: " + event.target.errorCode + "</li>";
        };
    }

    function createNotification(title, body, url) {
        setTimeout(() => {
            let notification = new Notification(title, {
                body: body,
                icon: "https://rtcamp.com/favicon.ico",
            });
            notification.onclick = function () {
                window.open(url);
            };
        }, 4000);
    }
};
