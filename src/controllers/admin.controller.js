
export function dashboard(
  req,
  res
) {
  return res.status(200).json({
    message: "Admin dashboard",
  });
}
