export const handleBasicInputChange = (
  event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  setter: React.Dispatch<React.SetStateAction<any>>
): void => {
  const { name, value } = event.target;
  setter((prev) => ({ ...prev, [name]: value }));
};