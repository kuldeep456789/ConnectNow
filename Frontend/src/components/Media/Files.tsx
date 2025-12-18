import { useParams } from "react-router-dom";
import { formatFileSize } from "../../library";
import { FileIcon } from "./FileIcon";
import { FileWrapper, FileName, FileSize } from "./Style";
import { IoMdDownload } from "react-icons/io";
import { Spinner } from "../Core";
import { Info } from "../Chat/ChatViewGroup/Style";
import { useEffect, useState } from "react";
import api from "../../services/api";

type FilesProps = {
  theme: string;
};

export function Files({ theme }: FilesProps) {
  const { id: conversationId } = useParams();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await api.get(`/messages/${conversationId}`);
        
        const fileMsgs = res.data.filter((msg: any) => msg.type === 'file');
        setFiles(fileMsgs);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError(true);
        setLoading(false);
      }
    }
    fetchFiles();
  }, [conversationId]);

  if (loading) return <Spinner />;
  if (error) return <Info>Error loading files</Info>;
  if (files.length === 0) return <Info>No file found</Info>;

  return (
    <div>
      {files.map((file) => (
        <FileWrapper
          key={file.id}
          theme={theme}
          href={file.content}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FileIcon extension={file.file?.name?.split(".").slice(-1)[0] || "txt"} />
          <div>
            <FileName>{file.file?.name}</FileName>
            <FileSize>{formatFileSize(file.file?.size)}</FileSize>
          </div>
          <IoMdDownload />
        </FileWrapper>
      ))}
    </div>
  );
}
