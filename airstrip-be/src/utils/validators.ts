import { ValidationError } from 'class-validator';

export function recursivelyGetChildrenErrors(
  errors: ValidationError[],
  propertyPath: string,
): {
  property: string;
  errorMessages: string[];
}[] {
  const validationErrors: {
    property: string;
    errorMessages: string[];
  }[] = [];

  errors.forEach((error) => {
    const errorMessages: string[] = [];
    const err = {
      property: `${propertyPath}${error.property}`,
      errorMessages,
    };
    Object.entries(error.constraints || {}).forEach(
      ([constraintName, errorMsg]) => {
        err.errorMessages.push(errorMsg);
      },
    );
    if (err.errorMessages.length) {
      validationErrors.push(err);
    }
    if (error.children) {
      validationErrors.push(
        ...recursivelyGetChildrenErrors(
          error.children,
          `${propertyPath}${error.property}.`,
        ),
      );
    }
  });

  return validationErrors;
}
