import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private users: Repository<User>) {}

  async login(email: string, password: string) {
    const user = await this.users.findOne({ where: { email } });
    if (!user || !user.password_hash) throw new Error('Invalid credentials');
    
    const valid = await argon2.verify(user.password_hash, password);
    if (!valid) throw new Error('Invalid credentials');

    const secret = process.env.JWT_SECRET || 'change_this_secret';
    const token = jwt.sign(
      { user_id: user.id, business_id: user.business_id, email: user.email },
      secret,
      { expiresIn: '7d' }
    );

    return { token, user: { id: user.id, name: user.name, email: user.email, business_id: user.business_id } };
  }

  async hashPassword(password: string) {
    return argon2.hash(password);
  }
}
