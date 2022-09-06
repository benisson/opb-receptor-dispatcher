import { BadRequestException, Logger, ValidationError } from "@nestjs/common";

export class ValidationException extends BadRequestException
{
    constructor(validationErrors: ValidationError[])
    {
        let error = getErrorData(validationErrors[0]);

        super(error, 'Formato dados incorreto');
    }

}

function getErrorData(validationError: ValidationError): string
{
    try
    {
        const contrains = validationError.constraints;
        if (validationError.constraints)
        {
            return contrains[Object.keys(contrains)[0]];
        } 
        else if (validationError.children)
        {
            return getErrorData(validationError.children[0]);
        } 
        else if (validationError.property)
        {
            return `Erro no campo '${validationError.property}'`;
        } 
        else
        {
            return 'Erro inesperado';
        }
    } catch (error)
    {
        Logger.error(error);
        return 'Erro inesperado';
    }
}
