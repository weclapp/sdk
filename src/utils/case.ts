// We can't use the pascalCase utility as it converts "cDBReminderType" to "CDbReminderType" which is incorrect.
export const loosePascalCase = (str: string): string => str[0].toUpperCase() + str.slice(1);
