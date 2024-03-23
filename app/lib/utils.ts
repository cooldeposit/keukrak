export function j(...classNames: string[]) {
  return classNames.join(" ");
}

export function dataURLtoFile(dataurl: string, filename: string) {
  const arr = dataurl.split(",");

  const match = arr[0].match(/:(.*?);/);

  if (!match) {
    throw new Error("Invalid data URL");
  }

  const mime = match[1];

  const bstr = atob(arr[arr.length - 1]);

  let n = bstr.length;

  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}
