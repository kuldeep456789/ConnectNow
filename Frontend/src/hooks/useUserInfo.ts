import { useEffect, useState } from "react";
import api from "../services/api";

const cache: { [key: string]: any } = {};

export const useUsersInfo = (userIds: string[]) => {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      // Check cache first
      const toFetch = (userIds || []).filter(id => !cache[id]);

      if (toFetch.length === 0) {
        setData(userIds.map(id => ({ data: () => cache[id], id: cache[id]?.uid }))); // Mocking .data() logic if needed or just return dict
        setLoading(false);
        return;
      }

      try {
        const response = await api.post('/users/batch', { uids: toFetch });
        const fetchedUsers = response.data;

        fetchedUsers.forEach((user: any) => {
          cache[user.uid] = user;
        });

        // Reconstruct full list
        const fullList = userIds.map(id => {
          const user = cache[id];
          // Mocking Firestore snapshot shape somewhat or just return data
          // ChatHeader expects: user.data()?.photoURL
          return {
            data: () => user,
            id: user?.uid
          };
        });

        setData(fullList);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(true);
        setLoading(false);
      }
    };

    if (userIds?.length > 0) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [JSON.stringify(userIds)]);

  return { data, loading, error };
};
