import { useEffect, useState } from "react";
import api from "../services/api";

export const useDocumentQuery = (key: string, url: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get(url);
        // Adapting API response to component structure
        setData({
          data: () => response.data,
          exists: () => true,
          id: response.data.conversationId
        });
        setError(false);
      } catch (err) {
        console.error(err);
        setError(true);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key, url]);

  return { loading, error, data };
};
