import { useParams } from "react-router-dom";
import { Grid, Image } from "./Style";
import { Spinner } from "../Core";
import { Info } from "../Chat/ChatViewGroup/Style";
import { useEffect, useState } from "react";
import api from "../../services/api";

export function ImageItem() {
  const { id: conversationId } = useParams();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await api.get(`/messages/${conversationId}`);
        // Filter for images
        const imgMsgs = res.data.filter((msg: any) => msg.type === 'image');
        setImages(imgMsgs);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError(true);
        setLoading(false);
      }
    }
    fetchImages();
  }, [conversationId]);

  if (loading) return <Spinner />;
  if (error) return <Info>Error loading images</Info>;
  if (images.length === 0) return <Info>No image found</Info>;

  return (
    <Grid>
      {images.map((image) => (
        <Image key={image.id} src={image.content} />
      ))}
    </Grid>
  );
}
