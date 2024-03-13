import {
    IsEmail,
    IsOptional,
    IsString,
} from 'class-validator';

export class EditUserDto {
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    Fname?: string;

    @IsString()
    @IsOptional()
    Lname?: string;
}