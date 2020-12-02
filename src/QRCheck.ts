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
            'Cookie': rawCookies,// 'NNB=RZDEGMP5ANKV6; NRTK=ag#all_gr#1_ma#-2_si#0_en#0_sp#0; nid_buk=RZDEGMP5ANKV6; nid_slevel=-1; nid_enctp=1; NID_AUT=hgctlf2GRhDnk7Uz/ea9ht0I5W5e+HZSskSu++IZn1zQefgNV96M/EExJLsEnZqF; NID_JKL=fd1WtsvgRzjJsg4Bg62wVBJ3A8/asEqggbdmNoMdfS4=; NaverSuggestUse=use%26unuse; MM_NEW=1; NFS=2; MM_NOW_COACH=1; _fbp=fb.1.1602238858835.2015549808; _ga_4BKHBFKFK0=GS1.1.1602238857.1.1.1602238866.51; nx_ssl=2; ASID=d3b32e4500000175eae0955c0000c715; _ga_7VKFYR6RV1=GS1.1.1606030779.35.1.1606030793.46; _ga=GA1.1.570951638.1599443242; NID_SES=AAABklRDwh57F6MsvwHdRU9Z9TB0C+A2v6EPp2V/3kmQmMLsYFa/C3lG7k7PsXzHGo3RJqFFRsij1gkvi1xtPyK0qCCZeMN1pD19VVclEi0qAJG/GL/YKV9+yqtOGKziUHZNlXLFDD0PyUD9bKcOtiDKSsNKTdSi0vtuS/CDs85XuD74TpqJ36Uq+i0fyAy7DmOgR9GZN2rfWR67vcZ09PkDdYLmXu2sxhPlsrALbw8jK+Lh6VDeHc0rplWhuY6EkF9KHe48AkGsBCiuNMDTC/yQfJFHwEKAUJIdVg6Dj06MJBWX82xBmZP+MUm5mDnrk7FyD0K1u8+8ZFNW3MU3pt1q5urmiGloC122JeQBLqJAqPRa/86JFXpwMVbaaxo2yjX41IqDk/T+06tWxDf5d6R3xsz1PCI1EYbYbuh4vFCuc0ZxqPNJqQZluAMxJEZowV4On59GE55BI6jx9SpavVsmgoRfFS3A/aIGV8fxZNG6WfZgETc0yZ+KteHffZ4sa/YueDjcL/B8MpGcUsaBqNGZDyiApDCvL8eaM2yBRQ2ZwtBP; NID_PQRT=Kw_RHjYR4Ms77PccbGyrT3qI_5TvOJwo946B6rbNJAI; NID_PQR=e22usOoyPs6uWJHH7Jtag-BnkPj7xRDnPn7d8MJYiYk; _naver_usersession_=fSH8dxqny0sRGoKXxf0+kdHs; page_uid=U8uvYsp0J14ssED6Qb8ssssssed-337454',
            'Referer': 'https://nid.naver.com/login/privacyQR',
            'UserAgent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Safari/605.1.15'
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
