import { FC, useEffect, useRef } from "react";
import "./App.css";
import GlobalStyles from "./GlobalStyles";
import styled from "styled-components";

const Button = styled.button`
  color: green;
  border: 1px solid green;
  margin: 10px;
`;

const App: FC = () => {
  const workerRef = useRef<Worker>();

  useEffect(() => {
    const worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });

    worker.addEventListener("message", (event: MessageEvent) => {
      if (event.data.processKey === "INSERT_DONE") {
        console.timeEnd("INSERT TIME");
        return;
      }

      if (event.data.processKey === "GET_DATA_DONE") {
        console.timeEnd("GET TIME");
        console.log(event.data.data);
        return;
      }

      if (event.data.processKey === "INSERT_BULK_DONE") {
        console.log("aleady insert 10000 data.");
        return;
      }

      if (event.data.processKey === "GET_DATA_ONE_DONE") {
        console.timeEnd("GET TIME");
        console.log(event.data.data);
      }
    });

    workerRef.current = worker;

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = undefined;
      }
    };
  }, []);

  const onInit = () => {
    workerRef.current?.postMessage({ processKey: "START_INSERT" });
    console.time("INSERT TIME");
  };

  const onGet = () => {
    console.time("GET TIME");
    workerRef.current?.postMessage({ processKey: "GET_DATA" });
  };

  const onGetOne = () => {
    console.time("GET TIME");
    const id = Math.floor(Math.random() * (500000 + 1));
    workerRef.current?.postMessage({ processKey: "GET_DATA_ONE", key: id });
  };

  return (
    <>
      <GlobalStyles />
      <Button onClick={onInit}>insert data</Button>
      <Button onClick={onGet}>get data</Button>
      <Button onClick={onGetOne}>get One</Button>
    </>
  );
};

export default App;
