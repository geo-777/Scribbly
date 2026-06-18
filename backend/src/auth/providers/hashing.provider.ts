import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HashingProvider {
  //generates hash
  public async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  //compares two hashes
  public async compare(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
