import { useEffect, useState } from "react";
import api from "../services/api";

export const useCollectionQuery = (key: string, url: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    // setLoading(true); // Don't reset loading on refetch to avoid flicker
    try {
      const response = await api.get(url);
      setData(response.data);
      setError(false);
    } catch (err) {
      console.error(err);
      setError(true);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [key, url]);

  return { loading, error, data, refetch: fetchData };
};
