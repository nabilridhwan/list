const app = require('./app');

if (process.env.IP || process.env.PORT) {
        app.listen(process.env.PORT, () => {
            console.log(`Listening on port ${process.env.PORT}`);
        });
} else {
        app.listen(8080, () => {
            console.log(`[LOCALLY] Listening on: 127.0.0.1:8080`);
        });
}