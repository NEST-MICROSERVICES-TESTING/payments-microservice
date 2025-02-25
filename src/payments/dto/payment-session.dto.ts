import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNumber, IsPositive, IsString, ValidateNested } from "class-validator";

export class PaymentSessionDto {

    @IsString()
    nIdOrder: string;

    @IsString()
    sCurrency   : string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type( () => PaymentSessionItemDto )
    aItems      : PaymentSessionItemDto[]
}

export class PaymentSessionItemDto {

    @IsString()
    sName: string;

    @IsNumber()
    @IsPositive()
    nPrice: number;

    @IsNumber()
    @IsPositive()
    nQuantity: number;
}


