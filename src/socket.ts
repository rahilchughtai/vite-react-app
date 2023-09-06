import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = 'https://sentence-socketio.adaptable.app:80';

export const socket = io(URL);
