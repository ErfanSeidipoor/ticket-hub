import jwt from 'jsonwebtoken';

export interface JwtToken {
  id: string;
  email: string;
}

export class Jwt {
  static sign(jwtToken: JwtToken): string {
    return jwt.sign(jwtToken, process.env['JWT_KEY']);
  }

  static verify(signed: string): JwtToken {
    const verified = jwt.verify(signed, process.env['JWT_KEY']) as JwtToken;
    return verified;
  }

  static getVerifiedFromCookie(cookies: [string]): JwtToken | undefined {
    for (const cookie of cookies[0].split('; ')) {
      if (cookie.indexOf('jwt=') === 0) {
        const signed = cookie.split('=')[1];
        if (signed) {
          return jwt.verify(signed, process.env['JWT_KEY']) as JwtToken;
        }
      }
    }

    return undefined;
  }
}
