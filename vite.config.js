import { defineConfig } from 'vite'

export default defineConfig({
    base: "./",
    build: {
        rollupOptions: {
            input: {
                main: "index.html",
                profile: "profile.html",
                routeDetails: "route-details.html"
            }
        }
    }
})