import { Toaster } from "react-hot-toast";

export default function ToasterContainer() {
  return <Toaster position="top-right" containerStyle={{ top: 24, right: 24 }} gutter={8} />;
}