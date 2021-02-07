import Axios, {
    AxiosRequestConfig,
    AxiosResponse
} from 'axios';
import {
    NaverManager,
    LoginCookies
} from './naverLogin';
import {
    parse,
    HTMLElement
} from 'node-html-parser';

class QRChecker {
    protected username: string;
    protected password: string;
    /**
     * 
     * @param username Username signed in with Naver
     * @param password Password signed with Naver
     * @constructor
     * @example
     * new QRChecker('Username', 'Password').getQR().then(res => console.log(res)).catch(e => console.log(e));
     */
    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
        return this;
    }
    /**
     * 
     * @param cookies Cookies object
     * @private
     */
    private toRawCookies(cookies: any): string {
        const cookieArr: string[] = [];
        for (let key in cookies) {
            cookieArr[cookieArr.length] = `${key}=${cookies[key]}`;
        }
        const cookie: string = cookieArr.reduce(
            (accumulated: string, currentCookie: string) =>
                (accumulated += `${currentCookie}; `),
            '',
        );
        return cookie;
    }
    /**
     * 
     * @returns base64 img
     */
    public async getQR(): Promise<string> {
        const username: string = this.username;
        const password: string = this.password;
        const cookies: LoginCookies = (await new NaverManager(username, password).login()).getCookies();
        const rawCookies: string = this.toRawCookies(cookies);
        const url: string = 'https://nid.naver.com/login/privacyQR';
        const headers: any = {
            'Cookie': rawCookies,
            'Referer': 'https://nid.naver.com/login/privacyQR',
            'UserAgent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36'
        };
        const config: AxiosRequestConfig = {
            headers
        };
        const response: AxiosResponse = await Axios.get(url, config);
        const document: string = response.data;
        const dom: HTMLElement = parse(document);
        const img: HTMLElement = dom.querySelector('#qrImage');
        const qrImage: string | undefined = img.getAttribute('src');
        if (qrImage) return qrImage
        else return '';
    }
}

export {
    QRChecker
}
