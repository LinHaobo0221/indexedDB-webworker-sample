const tableName = "myTable";

const step = 10000;
const totalBatches = Math.ceil(500_000 / step);

const initData = () => {
  const bigList = Array.from({ length: 500_000 }).map((_, index) => {
    return {
      id: index,
      name: `name_${index}`,
    };
  });

  const openRequest = indexedDB.open("myDB", 1);

  openRequest.onupgradeneeded = (event) => {
    const request = event.target as IDBOpenDBRequest;
    const db = request.result;

    // data table
    if (db.objectStoreNames.contains(tableName)) {
      db.deleteObjectStore(tableName);
    }

    db.createObjectStore(tableName, { keyPath: "id" });
  };

  openRequest.onsuccess = (event) => {
    console.log("insert start");
    const request = event.target as IDBOpenDBRequest;
    const db = request.result;

    const result = [];

    for (let i = 0; i < totalBatches; i++) {
      const start = i * step;
      const end = start + step;
      const data = bigList.slice(start, end);

      const trans = db.transaction(tableName, "readwrite");
      const store = trans.objectStore(tableName);

      trans.oncomplete = () => {
        postMessage({ processKey: "INSERT_BULK_DONE" });
        result.push(i);

        if (result.length === totalBatches) {
          postMessage({ processKey: "INSERT_DONE" });
        }
      };

      for (const rowData of data) {
        store.add(rowData);
      }
    }
  };
};

const getData = () => {
  const openRequest = indexedDB.open("myDB", 1);

  openRequest.onsuccess = (event) => {
    const request = event.target as IDBOpenDBRequest;
    const db = request.result;

    const trans = db.transaction(tableName, "readonly");
    const store = trans.objectStore(tableName);

    const range = IDBKeyRange.bound(1, 100);
    const getRequest = store.openCursor(range);

    const datas: { id: string; name: string }[] = [];

    getRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

      if (cursor) {
        datas.push(cursor.value);
        cursor.continue();
      } else {
        console.log("datas length:" + datas.length);
        postMessage({ processKey: "GET_DATA_DONE", data: datas });
      }
    };
  };
};

const getDataById = (id: number) => {
  const openRequest = indexedDB.open("myDB", 1);

  openRequest.onsuccess = (event) => {
    const request = event.target as IDBOpenDBRequest;
    const db = request.result;

    const trans = db.transaction(tableName, "readonly");
    const store = trans.objectStore(tableName);

    const getRequest = store.get(id);

    getRequest.onsuccess = (event) => {
      const data = (event.target as IDBRequest).result;

      postMessage({ processKey: "GET_DATA_ONE_DONE", data });
    };
  };
};

onmessage = (event: MessageEvent) => {
  const key = event.data.processKey;
  const id = event.data.key;

  if (key === "START_INSERT") {
    initData();
    return;
  }

  if (key === "GET_DATA") {
    getData();
    return;
  }

  if (key === "GET_DATA_ONE") {
    getDataById(id);
    return;
  }
};
