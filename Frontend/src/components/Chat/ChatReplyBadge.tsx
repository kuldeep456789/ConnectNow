import toast from "react-hot-toast";

type ReplyBadgeProps = {
  messageId: string;
};
export function ChatReplyBadge({ messageId }: ReplyBadgeProps) {
  // TODO: Fetch single message by ID
  const loading = false;
  const error = false;
  // Mock data
  const data = {
    data: () => ({ type: 'text', content: 'Replying to message...' })
  };

  if (loading || error) return <div>waiting</div>;

  return (
    <>
      <div
        onClick={() => {
          const element = document.querySelector(`#message-${messageId}`);
          if (element) element.scrollIntoView({ behavior: "smooth" });
          toast.error(
            "Cannot find your message. Try to scroll up to load more."
          );
        }}
      >
        {data?.data()?.type === "text" ? (
          <p>{data?.data()?.content}</p>
        ) : data?.data()?.type === "image" ? (
          "An image"
        ) : data?.data()?.type === "file" ? (
          "A file"
        ) : (
          "Message has been removed"
        )}
      </div>
    </>
  );
}
