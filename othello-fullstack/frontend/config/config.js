const config={
BackendUrl: String(import.meta.env.VITE_BACKEND_URL),
BackendGameUrl:`${String(import.meta.env.VITE_BACKEND_URL)}/game`
}
export default config;