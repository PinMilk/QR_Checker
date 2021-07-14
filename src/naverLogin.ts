import Axios, {
    AxiosRequestConfig,
    AxiosResponse
} from 'axios';
import {
    v4 as genUUID
} from 'uuid';
import LZString from 'lz-string';
import NodeRSA from 'node-rsa';
class NaverManager {
    protected username: string;
    protected password: string;
    protected cookies: LoginCookies = {
        nid_inf: '',
        NID_AUT: '',
        NID_SES: '',
        NID_JKL: ''
    };
    /**
     * 
     * @param username ID signed in with Naver
     * @param password Password signed with Naver
     * @constructor
     * @example 
     * new NaverManager('username', 'password').login().then(res => console.log(res.getCookies())).catch(e => console.log(e));
     */
    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
        return this;
    }
    /**
     * 
     * @param modulus Modulus length
     * @param exponent Public exponent
     * @returns Key object
     * @private
     */
    private rsaKeyGen(modulus: string, exponent: string): NodeRSA {
        const key: NodeRSA = new NodeRSA();
        key.importKey({
            e: Buffer.from(exponent, 'hex'),
            n: Buffer.from(modulus, 'hex')
        }, 'components-public');
        key.setOptions({
            encryptionScheme: 'pkcs1'
        });
        return key;
    }
    /**
     * 
     * @param message Message
     * @param modulus Modulus length
     * @param exponent Public exponent
     * @returns Cipher
     * @private
     */
    private encrypt(message: string, modulus: string, exponent: string): string {
        const encrypted: string = this.rsaKeyGen(modulus, exponent).encrypt(message, 'hex');
        return encrypted;
    }
    /**
     * 
     * @param url URL to send the request
     * @param config Request config
     * @private
     */
    private async getRequest(url: string, config: AxiosRequestConfig = {}): Promise<string> {
        return (await Axios.get(url, config)).data;
    }
    /**
     * 
     * @param url URL to send the request
     * @param data Request data
     * @param config Request config
     * @private
     */
    private async postRequest(url: string, data: any, config: AxiosRequestConfig = {}): Promise<AxiosResponse> {
        return (await Axios.post(url, data, config));
    }
    /**
     * 
     * @param formObj Object to be converted to form data
     * @private
     */
    private toFormData(formObj: any): string {
        const result: string[] = [];
        for (let property in formObj) result.push(`${property}=${formObj[property]}`);
        return result.join('&');
    }
    /**
     * 
     * @param rawCookies Cookies string
     * @returns Parsed cookies(Object)
     */
    private parseCookie(rawCookies: string): any {
        const cookies: any = {};
        const rawPair: string[] = rawCookies.split('; ');
        rawPair.forEach(
            (element: string, index: number) => {
                const cookiePair: string[] = element.split('=');
                const key: string = cookiePair[0];
                const value: string = cookiePair[1];
                cookies[key] = value;
            }
        );
        return cookies;
    }
    /**
     * 
     * @private
     * @reutrns Session key, using, encrypt modulus
     */
    private async getLoginKeys(): Promise<SignInfo> {
        const url: string = 'https://nid.naver.com/login/ext/keys2.nhn';
        const info: string = await this.getRequest(url);
        const [
            sessionKey,
            keyname,
            modulusLength,
            exponent
        ] = info.split(',');
        return {
            sessionKey,
            keyname,
            modulusLength,
            exponent
        };
    }
    /**
     * 
     * @param message Message to get character
     * @private
     */
    private getChar(message: string): string {
        return String.fromCharCode(message.length);
    }

    public async login() {
        const [username, password]: Array<string> = [
            this.username,
            this.password
        ];
        const uuid: string = genUUID();
        const {
            sessionKey,
            keyname,
            modulusLength,
            exponent
        }: SignInfo = await this.getLoginKeys();
        const message: string = this.getChar(sessionKey) + sessionKey + this.getChar(username) + username + this.getChar(password) + password;
        const encpw: string = this.encrypt(message, modulusLength, exponent);
        const info: string = JSON.stringify({
            "a": `${uuid}-4`,
            "b": "1.3.4",
            "d": [
                {
                    "i": "id",
                    "b": {
                        "a": [
                            `0,${username}`
                        ]
                    },
                    "d": `${username}`,
                    "e": false,
                    "f": false
                },
                {
                    "i": `${password}`,
                    "e": true,
                    "f": false
                }
            ],
            "h": "1f",
            "i": {
                "a": "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36"
            }
        });
        const encData: string = LZString.compressToEncodedURIComponent(info);
        const bvsd: string = encodeURIComponent(JSON.stringify({
            uuid,
            encData
        }));
        const url: string = 'https://nid.naver.com/nidlogin.login';
        const data: string = this.toFormData({
            encnm: keyname,
            encpw,
            bvsd,
            nvlong: 'on'
        });
        const config: AxiosRequestConfig = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36',
                'Connection': 'keep-alive',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
        const response: AxiosResponse = await this.postRequest(url, data, config);
        const document: string = response.data;
        if (response.status !== 200) throw new LoginError(`Connection error. Status code: ${response.status}`)
        if (document.split('\n').length > 15) throw new LoginError('Invaild username or password');
        const headers: any = response.headers;
        const cookies: any = {};
        const rawCookies: string[] = headers['set-cookie'];
        rawCookies.forEach(e => {
            const cookie: any = this.parseCookie(e);
            for (let key in cookie) {
                if (!['nid_inf', 'NID_AUT', 'NID_SES', 'NID_JKL'].includes(key)) continue;
                cookies[key] = cookie[key];
            }
        });
        Object.assign(this.cookies, cookies);
        return this;
    }
    public getCookies(): LoginCookies {
        return this.cookies;
    }
}

class LoginError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'LoginError';
        Object.setPrototypeOf(this, LoginError.prototype);
    }
}

interface SignInfo {
    sessionKey: string;
    keyname: string;
    modulusLength: string;
    exponent: string;
}

interface LoginCookies {
    nid_inf: string;
    NID_AUT: string;
    NID_SES: string;
    NID_JKL: string;
}

export {
    NaverManager,
    SignInfo,
    LoginError,
    LoginCookies
}