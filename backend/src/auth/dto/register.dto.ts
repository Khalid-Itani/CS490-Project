import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty() firstname: string;
  @IsNotEmpty() lastname: string;

  @IsEmail() email: string;

  @MinLength(8)
  @Matches(/[a-z]/, { message: 'password must contain a lowercase letter' })
  @Matches(/[A-Z]/, { message: 'password must contain an uppercase letter' })
  @Matches(/[0-9]/, { message: 'password must contain a number' })
  password: string;

  @IsNotEmpty() confirmPassword: string;
}
