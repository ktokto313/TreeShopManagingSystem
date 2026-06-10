/*
 * Name: User Management Page
 * @Author: DucLM
 * Date: 2026-06-05
 * Version: 2.0
 * Description: Top-level page route wrapping the admin user management container in the global layout.
 */
import { Container } from "../components/global/Container";
import { UserManagementContainer } from "../features/admin/UserManagementContainer";

export default function UserManagement() {
  return (
    <Container>
      <UserManagementContainer />
    </Container>
  );
}
