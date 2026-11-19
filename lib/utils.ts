export function getZodErrorMessage(error: any): string {
  if (!error) return "بيانات غير صالحة";
  if (Array.isArray(error.issues) && error.issues.length > 0) {
    return error.issues[0]?.message || "بيانات غير صالحة";
  }
  if (Array.isArray(error.errors) && error.errors.length > 0) {
    return error.errors[0]?.message || "بيانات غير صالحة";
  }
  return error.message || "بيانات غير صالحة";
}
