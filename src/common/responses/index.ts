/**
 * Lớp ResponseAPI tạo định dạng phản hồi dữ liệu chuẩn cho Client:
 * { data, message, status }
 *
 * @example
 * return ResponseAPI.sendOK(data, 'Lấy danh sách thành công');
 * return ResponseAPI.sendCreated('Tạo mới thành công!', newUser);
 * return ResponseAPI.sendNotFound('Không tìm thấy dữ liệu');
 */
export class ResponseAPI {
  static sendAPI<T = any>(
    data: T | object = {},
    message: string = '',
    status: boolean = true,
  ) {
    return {
      data,
      message,
      status,
    };
  }

  static sendOK<T = any>(data: T | object = {}, message: string = '') {
    return this.sendAPI(data, message, true);
  }

  static sendCreated<T = any>(
    message: string = 'Created successfully!',
    data: T | object = {},
  ) {
    return this.sendAPI(data, message, true);
  }

  static sendNotFound<T = any>(
    message: string = 'Not Found',
    data: T | object = {},
  ) {
    return this.sendAPI(data, message, false);
  }
}

export class SuccessResponse {
  static ok<T = any>(data: T | object = {}, message: string = 'Success') {
    return ResponseAPI.sendOK(data, message);
  }

  static created<T = any>(
    data: T | object = {},
    message: string = 'Created successfully!',
  ) {
    return ResponseAPI.sendCreated(message, data);
  }
}
