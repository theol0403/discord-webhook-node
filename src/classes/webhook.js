const sendWebhook = require('../sendWebhook');

module.exports = class webhook {
    constructor(options){
        if (typeof options == 'string'){
            this.hookURL = options;
            this.throwErrors = true;
            this.retryOnLimit = true;
        }
        else {
            this.hookURL = options.url;
            this.throwErrors = options.throwErrors == undefined ? true : options.throwErrors;
            this.retryOnLimit = options.retryOnLimit == undefined ? true : options.retryOnLimit;
        };
    };

    async send(payload){
        try {
            const res = await sendWebhook(this.hookURL, payload);

            if (res.status == 429 && this.retryOnLimit){
                const body = await res.json();
                const waitUntil = body["retry_after"];

                setTimeout(() => sendWebhook(this.hookURL, payload), waitUntil);
            }
            else if (res.status != 204){
                throw new Error(`Error sending webhook: ${res.status} status code. Response: ${await res.text()}`);
            };
        }
        catch(err){
            if (this.throwErrors) throw new Error(err.message);
        };
    };
};