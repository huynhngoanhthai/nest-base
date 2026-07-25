/**
 * Class bọc Response chuẩn hoá định dạng trả về cho Client.
 *
 * @example
 * return new SuccessResponse(user, 'Lấy thông tin người dùng thành công');
 * return SuccessResponse.ok(user, 'Thành công');
 * return SuccessResponse.created(newUser, 'Tạo mới thành công');
 */
export class SuccessResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;

  constructor(
    data: T | null,
    message: string = 'Success',
    statusCode: number = 200,
  ) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  static ok<T>(data: T, message: string = 'Success') {
    return new SuccessResponse(data, message, 200);
  }

  static created<T>(data: T, message: string = 'Created successfully') {
    return new SuccessResponse(data, message, 201);
  }
}
