import { useContext } from "react";
import { SocketContext } from "./SocketContext";

export const useSocketContext = () => useContext(SocketContext);
