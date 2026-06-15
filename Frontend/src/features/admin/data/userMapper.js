/*
 * Name: User DTO Mapper
 * @Author: DucLM
 * Date: 2026-06-05
 * Version: 2.0
 * Description: Converts between backend UserDTO shape and frontend user model for admin UI consumption.
 */
/**
 * Maps backend UserDTO to frontend user shape.
 * status false = banned (see UserService.banUser / unbanUser).
 */
export function mapUserFromApi(dto) {
  if (!dto) return null;
  return {
    id: dto.id,
    email: dto.email,
    fullName: dto.fullName,
    phone: dto.phone ?? null,
    role: dto.roleName ?? null,
    isBanned: dto.status === false,
    createdAt: dto.createdAt ?? null,
  };
}

export function mapUsersFromApi(list) {
  if (!Array.isArray(list)) return [];
  return list.map(mapUserFromApi).filter(Boolean);
}

/**
 * Maps frontend form/user to UserDTO payload for create/update.
 */
export function mapUserToApi(user, { forCreate = false } = {}) {
  const payload = {};

  if (user.fullName != null && user.fullName !== "") {
    payload.fullName = user.fullName;
  }
  if (user.phone != null) {
    payload.phone = user.phone;
  }
  const roleName = user.roleName ?? user.role;
  if (roleName != null && roleName !== "") {
    payload.roleName = roleName;
  }
  if (forCreate) {
    if (user.email) payload.email = user.email;
    if (user.password) payload.password = user.password;
  } else if (user.password) {
    payload.password = user.password;
  }

  return payload;
}
