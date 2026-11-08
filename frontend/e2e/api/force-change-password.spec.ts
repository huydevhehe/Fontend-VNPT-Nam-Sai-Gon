import { expect, test } from "@playwright/test";
import { ADMIN, API_URL, apiLogin, bearer } from "./helpers";

test.describe("Bắt đổi mật khẩu nhân viên mới (API)", () => {
  test("Nhân viên tạo bằng mật khẩu tự sinh có mustChangePassword=true, tự đặt pass có mustChangePassword=false", async ({
    request,
  }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);

    // 1. Tạo NV dùng pass tự sinh
    const codeAuto = `NV-AUTO-${Date.now()}`;
    const resAuto = await request.post(`${API_URL}/staff`, {
      headers: bearer(adminToken),
      data: {
        code: codeAuto,
        name: "Nhân viên Mật khẩu tự sinh",
        role: "AM",
        territory: "Phường 1",
      },
    });
    expect(resAuto.status()).toBe(201);
    const defaultPassword = `${codeAuto}@Vnpt2026`;

    // Login bằng pass tự sinh -> mustChangePassword = true
    const loginAutoRes = await request.post(`${API_URL}/auth/login`, {
      data: { username: codeAuto, password: defaultPassword },
    });
    expect(loginAutoRes.status()).toBe(200);
    const loginAutoData = await loginAutoRes.json();
    expect(loginAutoData.data.user.mustChangePassword).toBe(true);

    // 2. Tạo NV tự đặt pass
    const codeCustom = `NV-CUST-${Date.now()}`;
    const customPass = "CustomPass@1234";
    const resCustom = await request.post(`${API_URL}/staff`, {
      headers: bearer(adminToken),
      data: {
        code: codeCustom,
        name: "Nhân viên Mật khẩu tự đặt",
        role: "AM",
        territory: "Phường 2",
        password: customPass,
      },
    });
    expect(resCustom.status()).toBe(201);

    // Login bằng custom pass -> mustChangePassword = false
    const loginCustomRes = await request.post(`${API_URL}/auth/login`, {
      data: { username: codeCustom, password: customPass },
    });
    expect(loginCustomRes.status()).toBe(200);
    const loginCustomData = await loginCustomRes.json();
    expect(loginCustomData.data.user.mustChangePassword).toBe(false);
  });

  test("Đổi mật khẩu: kiểm tra sai mật khẩu hiện tại, mật khẩu quá ngắn và đổi thành công", async ({
    request,
  }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);

    const code = `NV-CHG-${Date.now()}`;
    await request.post(`${API_URL}/staff`, {
      headers: bearer(adminToken),
      data: {
        code,
        name: "Nhân viên Đổi pass",
        role: "AM",
        territory: "Phường 3",
      },
    });
    const defaultPassword = `${code}@Vnpt2026`;

    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { username: code, password: defaultPassword },
    });
    const token = (await loginRes.json()).data.token;

    // Sai mật khẩu hiện tại -> 401
    const wrongCurrent = await request.post(`${API_URL}/auth/change-password`, {
      headers: bearer(token),
      data: { currentPassword: "wrong-password", newPassword: "NewSecurePassword1" },
    });
    expect(wrongCurrent.status()).toBe(401);

    // Mật khẩu mới quá ngắn -> 400
    const shortPass = await request.post(`${API_URL}/auth/change-password`, {
      headers: bearer(token),
      data: { currentPassword: defaultPassword, newPassword: "123" },
    });
    expect(shortPass.status()).toBe(400);

    // Đổi mật khẩu thành công -> 200
    const newPass = "NewSecurePassword123";
    const successRes = await request.post(`${API_URL}/auth/change-password`, {
      headers: bearer(token),
      data: { currentPassword: defaultPassword, newPassword: newPass },
    });
    expect(successRes.status()).toBe(200);

    // Đăng nhập bằng mật khẩu mới -> thành công, mustChangePassword = false
    const newLogin = await request.post(`${API_URL}/auth/login`, {
      data: { username: code, password: newPass },
    });
    expect(newLogin.status()).toBe(200);
    const newLoginData = await newLogin.json();
    expect(newLoginData.data.user.mustChangePassword).toBe(false);

    // Mật khẩu cũ không đăng nhập được nữa
    const oldLogin = await request.post(`${API_URL}/auth/login`, {
      data: { username: code, password: defaultPassword },
    });
    expect(oldLogin.status()).toBe(401);
  });
});
