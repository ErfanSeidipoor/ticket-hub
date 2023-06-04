import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class SignupRequestAuth {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(130)
  password: string;
}
