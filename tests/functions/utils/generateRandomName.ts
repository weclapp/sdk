export const generateRandomName = (): string => {
	return `${Math.floor(Math.random() * 1e14).toString()} testSDK`;
}
