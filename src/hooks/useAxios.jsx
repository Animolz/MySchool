import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";
import axiosClient from "../app/api/axiosClient";
import useAuthSelector from "../hooks/Selectors/useAuthSelector";
import RESPONSE_STATUS from "../config/RESPONSE_STATUS";
import axios from "axios";

const useAxios = ({ url = "", method = "", body = {}, options = {} }) => {
  const { accessToken } = useAuthSelector();

  const [data, setData] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const runOnce = useRef(false);

  const fetch = async () => {
    let cancelToken;

    if (typeof cancelToken !== typeof undefined) {
      cancelToken.cancel("Canceled due to new Request");
    }

    cancelToken = axios.CancelToken.source();

    try {
      setStatus("pending");
      setError("");

      let result = null;

      if (method !== "get") {
        result = await axiosClient[method](url, body, {
          ...options,
          cancelToken: cancelToken.token,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } else {
        result = await axiosClient.get(url, {
          ...options,
          cancelToken: cancelToken.token,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }

      if (RESPONSE_STATUS.some((status) => status === result.status)) {
        setData(result.data);
        setStatus("fulfilled");
        setError("");
      }
    } catch (error) {
      setStatus("rejected");
      setError(error.message);
      setData("");
    }
  };

  useEffect(() => {
    if (runOnce.current) return;

    if (status === "idle") fetch();
    return () => {
      runOnce.current = true;
    };
  }, []);

  return { data, status, error };
};
export default useAxios;
