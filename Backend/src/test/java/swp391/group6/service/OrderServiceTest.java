package swp391.group6.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import swp391.group6.dto.LoginResponse;
import swp391.group6.dto.OrderDTO;
import swp391.group6.exception.InvalidStateTransitionException;
import swp391.group6.model.Order;
import swp391.group6.model.OrderStatus;
import swp391.group6.model.Role;
import swp391.group6.model.ShoppingCart;
import swp391.group6.model.User;
import swp391.group6.repository.OrderRepository;
import swp391.group6.repository.ReviewRepository;
import swp391.group6.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private NotificationService notificationService;

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(orderRepository, userRepository, reviewRepository, notificationService);
    }

    @Test
    void getOrders_managerWithStatusFilter_searchesAllOrdersByStatusesAndUsesBlankQueryWhenNull() {
        LoginResponse manager = login("manager@example.com", "MANAGER");
        List<OrderStatus> statuses = List.of(OrderStatus.PENDING);
        List<Order> expected = List.of(order(1L, customer(), shipper(), OrderStatus.PENDING));
        when(orderRepository.searchByStatusInOrderByStatusAscThenCreatedAtDesc(statuses.
                stream().map(Enum::toString).toList(), "")).thenReturn(expected);

        List<Order> actual = orderService.getOrders(manager, statuses, null);

        assertSame(expected, actual);
        verify(orderRepository).searchByStatusInOrderByStatusAscThenCreatedAtDesc(statuses.
                stream().map(Enum::toString).toList(), "");
        verifyNoInteractions(userRepository);
    }

    @Test
    void getOrders_systemAdminWithoutStatusFilter_searchesAllOrders() {
        LoginResponse admin = login("admin@example.com", "SYSTEM_ADMIN");
        List<Order> expected = List.of(order(1L, customer(), shipper(), OrderStatus.PENDING));
        when(orderRepository.searchAllOrderByStatusAscThenCreatedAtDesc("tree")).thenReturn(expected);

        List<Order> actual = orderService.getOrders(admin, List.of(), "tree");

        assertSame(expected, actual);
        verify(orderRepository).searchAllOrderByStatusAscThenCreatedAtDesc("tree");
        verifyNoInteractions(userRepository);
    }

    @Test
    void getOrders_limitedUserMissingFromRepository_returnsEmptyList() {
        LoginResponse customerLogin = login("missing@example.com", "CUSTOMER");
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        List<Order> actual = orderService.getOrders(customerLogin, List.of(OrderStatus.PENDING), "tree");

        assertTrue(actual.isEmpty());
        verifyNoInteractions(orderRepository);
    }

    @Test
    void getOrders_limitedUserWithStatusFilter_searchesByUserOrShipperAndStatuses() {
        LoginResponse customerLogin = login("customer@example.com", "CUSTOMER");
        User user = customer();
        List<OrderStatus> statuses = List.of(OrderStatus.PENDING, OrderStatus.DELIVERING);
        List<Order> expected = List.of(order(1L, user, shipper(), OrderStatus.PENDING));
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(user));
        when(orderRepository.searchByStatusInAndUserIdOrShipperIdOrderByStatusAscThenCreatedAtDesc(statuses
                .stream().map(Enum::toString).toList(), "tree", 10L, 10L))
            .thenReturn(expected);

        List<Order> actual = orderService.getOrders(customerLogin, statuses, "tree");

        assertSame(expected, actual);
        verify(orderRepository).searchByStatusInAndUserIdOrShipperIdOrderByStatusAscThenCreatedAtDesc(statuses
                .stream().map(Enum::toString).toList(), "tree", 10L, 10L);
    }

    @Test
    void getOrders_limitedUserWithoutStatusFilter_searchesByUserOrShipperOnly() {
        LoginResponse customerLogin = login("customer@example.com", "CUSTOMER");
        User user = customer();
        List<Order> expected = List.of(order(1L, user, shipper(), OrderStatus.PENDING));
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(user));
        when(orderRepository.searchByUserIdOrShipperIdOrderByStatusAscThenCreatedAtDesc("tree", 10L, 10L)).thenReturn(expected);

        List<Order> actual = orderService.getOrders(customerLogin, null, "tree");

        assertSame(expected, actual);
        verify(orderRepository).searchByUserIdOrShipperIdOrderByStatusAscThenCreatedAtDesc("tree", 10L, 10L);
    }

    @Test
    void getOrder_managerReadsById() {
        LoginResponse manager = login("manager@example.com", "MANAGER");
        Order expected = order(5L, customer(), shipper(), OrderStatus.PENDING);
        when(orderRepository.findById(5L)).thenReturn(Optional.of(expected));

        Order actual = orderService.getOrder(5L, manager);

        assertSame(expected, actual);
        verify(orderRepository).findById(5L);
        verifyNoInteractions(userRepository);
    }

    @Test
    void getOrder_limitedUserMissingFromRepository_returnsNull() {
        LoginResponse customerLogin = login("missing@example.com", "CUSTOMER");
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        Order actual = orderService.getOrder(5L, customerLogin);

        assertNull(actual);
        verifyNoInteractions(orderRepository);
    }

    @Test
    void getOrder_limitedUserReadsOnlyOwnOrAssignedOrder() {
        LoginResponse customerLogin = login("customer@example.com", "CUSTOMER");
        User user = customer();
        Order expected = order(5L, user, shipper(), OrderStatus.PENDING);
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(user));
        when(orderRepository.findOrderByIdAndUser_IdOrShipper_Id(5L, 10L, 10L))
                .thenReturn(Optional.of(expected));

        Order actual = orderService.getOrder(5L, customerLogin);

        assertSame(expected, actual);
        verify(orderRepository).findOrderByIdAndUser_IdOrShipper_Id(5L, 10L, 10L);
    }

    @Test
    void getOrder_returnsNullWhenRepositoryDoesNotFindOrder() {
        LoginResponse admin = login("admin@example.com", "SYSTEM_ADMIN");
        when(orderRepository.findById(404L)).thenReturn(Optional.empty());

        Order actual = orderService.getOrder(404L, admin);

        assertNull(actual);
    }

    @Test
    void changeOrder_returnsFalseWhenRequesterDoesNotExist() {
        LoginResponse manager = login("manager@example.com", "MANAGER");
        when(userRepository.findByEmail("manager@example.com")).thenReturn(Optional.empty());

        boolean changed = orderService.changeOrder(manager, 1L, orderDtoWithShipper(20L));

        assertFalse(changed);
        verify(orderRepository, never()).findById(1L);
    }

    @Test
    void changeOrder_returnsFalseWhenRequesterIsNotManager() {
        LoginResponse customerLogin = login("customer@example.com", "CUSTOMER");
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customer()));

        boolean changed = orderService.changeOrder(customerLogin, 1L, orderDtoWithShipper(20L));

        assertFalse(changed);
        verify(orderRepository, never()).findById(1L);
    }

    @Test
    void changeOrder_returnsFalseWhenOrderDoesNotExist() {
        LoginResponse managerLogin = login("manager@example.com", "MANAGER");
        when(userRepository.findByEmail("manager@example.com")).thenReturn(Optional.of(manager()));
        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        boolean changed = orderService.changeOrder(managerLogin, 1L, orderDtoWithShipper(20L));

        assertFalse(changed);
        verify(userRepository, never()).findById(20L);
    }

    @Test
    void changeOrder_assignsShipperAndMovesProcessingOrderToPending() {
        LoginResponse managerLogin = login("manager@example.com", "MANAGER");
        User manager = manager();
        User newShipper = shipper();
        Order existingOrder = order(1L, customer(), null, OrderStatus.PROCESSING);
        when(userRepository.findByEmail("manager@example.com")).thenReturn(Optional.of(manager));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(existingOrder));
        when(userRepository.findById(20L)).thenReturn(Optional.of(newShipper));

        boolean changed = orderService.changeOrder(managerLogin, 1L, orderDtoWithShipper(20L));

        assertTrue(changed);
        assertSame(newShipper, existingOrder.getShipper());
        assertEquals(OrderStatus.PENDING, existingOrder.getStatus());
        verify(orderRepository).save(existingOrder);
    }

    @Test
    void changeOrder_assignsShipperWithoutChangingNonProcessingStatus() {
        LoginResponse managerLogin = login("manager@example.com", "MANAGER");
        User newShipper = shipper();
        Order existingOrder = order(1L, customer(), null, OrderStatus.PENDING);
        when(userRepository.findByEmail("manager@example.com")).thenReturn(Optional.of(manager()));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(existingOrder));
        when(userRepository.findById(20L)).thenReturn(Optional.of(newShipper));

        boolean changed = orderService.changeOrder(managerLogin, 1L, orderDtoWithShipper(20L));

        assertTrue(changed);
        assertSame(newShipper, existingOrder.getShipper());
        assertEquals(OrderStatus.PENDING, existingOrder.getStatus());
        verify(orderRepository).save(existingOrder);
    }

    @Test
    void changeOrder_returnsFalseWhenRequestedShipperDoesNotExist() {
        LoginResponse managerLogin = login("manager@example.com", "MANAGER");
        Order existingOrder = order(1L, customer(), null, OrderStatus.PENDING);
        when(userRepository.findByEmail("manager@example.com")).thenReturn(Optional.of(manager()));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(existingOrder));
        when(userRepository.findById(20L)).thenReturn(Optional.empty());

        boolean changed = orderService.changeOrder(managerLogin, 1L, orderDtoWithShipper(20L));

        assertFalse(changed);
        verify(orderRepository, never()).save(existingOrder);
    }

    @Test
    void changeOrder_returnsFalseWhenShipperIdIsNotPositive() {
        LoginResponse managerLogin = login("manager@example.com", "MANAGER");
        Order existingOrder = order(1L, customer(), null, OrderStatus.PENDING);
        when(userRepository.findByEmail("manager@example.com")).thenReturn(Optional.of(manager()));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(existingOrder));

        boolean changed = orderService.changeOrder(managerLogin, 1L, orderDtoWithShipper(0L));

        assertFalse(changed);
        verify(userRepository, never()).findById(0L);
        verify(orderRepository, never()).save(existingOrder);
    }

    @Test
    void changeOrder_throwsWhenShipperIdIsNull() {
        LoginResponse managerLogin = login("manager@example.com", "MANAGER");
        Order existingOrder = order(1L, customer(), null, OrderStatus.PENDING);
        OrderDTO dto = new OrderDTO();
        when(userRepository.findByEmail("manager@example.com")).thenReturn(Optional.of(manager()));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(existingOrder));

        assertThrows(NullPointerException.class, () -> orderService.changeOrder(managerLogin, 1L, dto));
    }

    @Test
    void changeOrderStatus_returnsFalseWhenOrderDoesNotExist() {
        LoginResponse managerLogin = login("manager@example.com", "MANAGER");
        when(userRepository.findByEmail("manager@example.com")).thenReturn(Optional.of(manager()));
        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        boolean changed = orderService.changeOrderStatus(1L, OrderStatus.PENDING, managerLogin);

        assertFalse(changed);
        verify(orderRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void changeOrderStatus_limitedUserCannotModifyUnrelatedOrder() {
        LoginResponse customerLogin = login("customer@example.com", "CUSTOMER");
        User requester = customer();
        Order existingOrder = order(1L, manager(), shipper(), OrderStatus.ARRIVED);
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(requester));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(existingOrder));

        boolean changed = orderService.changeOrderStatus(1L, OrderStatus.RECEIVED, customerLogin);

        assertFalse(changed);
        assertEquals(OrderStatus.ARRIVED, existingOrder.getStatus());
        verify(orderRepository, never()).save(existingOrder);
    }

    @Test
    void changeOrderStatus_limitedShipperCannotModifyUnrelatedOrder() {
        LoginResponse shipper = login("SHIPPER@example.com", "SHIPPER");
        User requester = user(1, "SHIPPER");
        User orderShipper = user(2, "SHIPPER");
        Order existingOrder = order(1L, manager(), orderShipper, OrderStatus.DELIVERING);
        when(userRepository.findByEmail("SHIPPER@example.com")).thenReturn(Optional.of(requester));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(existingOrder));

        boolean changed = orderService.changeOrderStatus(1L, OrderStatus.ARRIVED, shipper);

        assertFalse(changed);
        assertEquals(OrderStatus.DELIVERING, existingOrder.getStatus());
        verify(orderRepository, never()).save(existingOrder);
    }

    @Test
    void changeOrderStatus_limitedUserReturnsFalseWhenTransitionIsInvalid() {
        LoginResponse customerLogin = login("customer@example.com", "CUSTOMER");
        User requester = user(1, "CUSTOMER");
        User orderUser = user(2, "CUSTOMER");
        Order existingOrder = order(1L, requester, shipper(), OrderStatus.PENDING);
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(orderUser));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(existingOrder));

        boolean changed = orderService.changeOrderStatus(1L, OrderStatus.RECEIVED, customerLogin);

        assertFalse(changed);
        assertEquals(OrderStatus.PENDING, existingOrder.getStatus());
        verify(orderRepository, never()).save(existingOrder);
    }

    @Test
    void changeOrderStatus_limitedUserCanApplyAllowedTransition() {
        LoginResponse customerLogin = login("customer@example.com", "CUSTOMER");
        User requester = customer();
        Order existingOrder = order(1L, requester, shipper(), OrderStatus.ARRIVED);
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(requester));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(existingOrder));

        boolean changed = orderService.changeOrderStatus(1L, OrderStatus.RECEIVED, customerLogin);

        assertTrue(changed);
        assertEquals(OrderStatus.RECEIVED, existingOrder.getStatus());
        verify(orderRepository).save(existingOrder);
    }

    @Test
    void changeOrderStatus_limitedShipperCanApplyAllowedTransition() {
        LoginResponse shipper = login("shipper@example.com", "SHIPPER");
        User requester = shipper();
        Order existingOrder = order(1L, customer(), requester, OrderStatus.DELIVERING);
        when(userRepository.findByEmail("shipper@example.com")).thenReturn(Optional.of(requester));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(existingOrder));

        boolean changed = orderService.changeOrderStatus(1L, OrderStatus.ARRIVED, shipper);

        assertTrue(changed);
        assertEquals(OrderStatus.ARRIVED, existingOrder.getStatus());
        verify(orderRepository).save(existingOrder);
    }

    @Test
    void changeOrderStatus_systemAdminSavesWithoutChangingStatus() {
        LoginResponse adminLogin = login("admin@example.com", "SYSTEM_ADMIN");
        Order existingOrder = order(1L, customer(), shipper(), OrderStatus.PENDING);
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(systemAdmin()));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(existingOrder));

        boolean changed = orderService.changeOrderStatus(1L, OrderStatus.DELIVERING, adminLogin);

        assertTrue(changed);
        assertEquals(OrderStatus.PENDING, existingOrder.getStatus());
        verify(orderRepository).save(existingOrder);
    }

    @ParameterizedTest
    @MethodSource("allowedTransitions")
    void tryToChangeState_allowsValidRoleTransitions(
            OrderStatus from,
            OrderStatus to,
            String roleName
    ) {
        Order order = order(1L, customer(), shipper(), from);

        orderService.tryToChangeState(order, user(99L, roleName), to);

        assertEquals(to, order.getStatus());
    }

    @ParameterizedTest
    @MethodSource("invalidTransitions")
    void tryToChangeState_rejectsInvalidTransitions(
            OrderStatus from,
            OrderStatus to,
            String roleName
    ) {
        Order order = order(1L, customer(), shipper(), from);
        User user = user(99L, roleName);

        assertThrows(
                InvalidStateTransitionException.class,
                () -> orderService.tryToChangeState(order, user, to));
        assertEquals(from, order.getStatus());
    }

    @Test
    void tryToChangeState_rejectsTransitionWhenRoleCannotBeResolved() {
        Order order = order(1L, customer(), shipper(), OrderStatus.PENDING);

        User user = new User();

        assertThrows(
                InvalidStateTransitionException.class,
                () -> orderService.tryToChangeState(order, user, OrderStatus.DELIVERING));
        assertEquals(OrderStatus.PENDING, order.getStatus());
    }

    @Test
    void tryToChangeState_rejectsTransitionWhenUserCannotBeResolved() {
        Order order = order(1L, customer(), shipper(), OrderStatus.PENDING);

        assertThrows(
                InvalidStateTransitionException.class,
                () -> orderService.tryToChangeState(order, null, OrderStatus.DELIVERING));
        assertEquals(OrderStatus.PENDING, order.getStatus());
    }

    @Test
    void tryToChangeState_rejectsTransitionWhenRoleNameCannotBeResolved() {
        Order order = order(1L, customer(), shipper(), OrderStatus.PENDING);

        User user = new User();
        user.setRole(new Role());

        assertThrows(
                InvalidStateTransitionException.class,
                () -> orderService.tryToChangeState(order, user, OrderStatus.DELIVERING));
        assertEquals(OrderStatus.PENDING, order.getStatus());
    }

    @Test
    void tryToChangeState_rejectsNullFromOrTargetStatus() {
        Order nullCurrent = order(1L, customer(), shipper(), null);
        Order pending = order(2L, customer(), shipper(), OrderStatus.PENDING);
        User manager = manager();

        assertThrows(
                InvalidStateTransitionException.class,
                () -> orderService.tryToChangeState(nullCurrent, manager, OrderStatus.PENDING));
        assertThrows(
                InvalidStateTransitionException.class,
                () -> orderService.tryToChangeState(pending, manager, null));
    }

    @Test
    void tryToChangeState_requiresShipperForNonProcessingTarget() {
        Order order = order(1L, customer(), null, OrderStatus.PENDING);
        User manager = manager();

        assertThrows(
                InvalidStateTransitionException.class,
                () -> orderService.tryToChangeState(order, manager, OrderStatus.DELIVERING));
        assertEquals(OrderStatus.PENDING, order.getStatus());
    }

    @Test
    void canAccessAllOrder_isTrueOnlyForManagerAndSystemAdmin() {
        assertTrue(orderService.canAccessAllOrder(login("manager@example.com", "MANAGER")));
        assertTrue(orderService.canAccessAllOrder(login("admin@example.com", "SYSTEM_ADMIN")));
        assertFalse(orderService.canAccessAllOrder(login("customer@example.com", "CUSTOMER")));
    }

    @Test
    void canModifyAllOrder_isTrueOnlyForSystemAdmin() {
        assertTrue(orderService.canAccessAllOrder(login("admin@example.com", "SYSTEM_ADMIN")));
        assertFalse(orderService.canAccessAllOrder(login("manager@example.com", "MANAGER")));
    }

    private static Stream<Arguments> allowedTransitions() {
        return Stream.of(
                Arguments.of(OrderStatus.PROCESSING, OrderStatus.PENDING, "manager"),
                Arguments.of(OrderStatus.PENDING, OrderStatus.DELIVERING, "MANAGER"),
                Arguments.of(OrderStatus.DELIVERING, OrderStatus.ARRIVED, "SHIPPER"),
                Arguments.of(OrderStatus.DELIVERING, OrderStatus.RETURNING, "SHIPPER"),
                Arguments.of(OrderStatus.ARRIVED, OrderStatus.RECEIVED, "CUSTOMER"),
                Arguments.of(OrderStatus.ARRIVED, OrderStatus.RETURN_PENDING, "CUSTOMER"),
                Arguments.of(OrderStatus.RETURN_PENDING, OrderStatus.RETURNING, "MANAGER"),
                Arguments.of(OrderStatus.RETURNING, OrderStatus.FAILED, "SHIPPER")
        );
    }

    private static Stream<Arguments> invalidTransitions() {
        return Stream.of(
                Arguments.of(OrderStatus.PROCESSING, OrderStatus.DELIVERING, "MANAGER"),
                Arguments.of(OrderStatus.PROCESSING, OrderStatus.PENDING, "SHIPPER"),
                Arguments.of(OrderStatus.PENDING, OrderStatus.DELIVERING, "CUSTOMER"),
                Arguments.of(OrderStatus.PENDING, OrderStatus.ARRIVED, "MANAGER"),
                Arguments.of(OrderStatus.DELIVERING, OrderStatus.ARRIVED, "MANAGER"),
                Arguments.of(OrderStatus.DELIVERING, OrderStatus.RETURNING, "MANAGER"),
                Arguments.of(OrderStatus.DELIVERING, OrderStatus.FAILED, "MANAGER"),
                Arguments.of(OrderStatus.ARRIVED, OrderStatus.FAILED, "CUSTOMER"),
                Arguments.of(OrderStatus.ARRIVED, OrderStatus.RETURN_PENDING, "SHIPPER"),
                Arguments.of(OrderStatus.RETURN_PENDING, OrderStatus.RECEIVED, "MANAGER"),
                Arguments.of(OrderStatus.RETURN_PENDING, OrderStatus.RETURNING, "SHIPPER"),
                Arguments.of(OrderStatus.RETURNING, OrderStatus.ARRIVED, "SHIPPER"),
                Arguments.of(OrderStatus.RETURNING, OrderStatus.FAILED, "MANAGER"),
                Arguments.of(OrderStatus.RECEIVED, OrderStatus.RETURN_PENDING, "CUSTOMER")
        );
    }

    private static LoginResponse login(String email, String role) {
        return new LoginResponse(email, "Test User", role);
    }

    private static OrderDTO orderDtoWithShipper(long shipperId) {
        OrderDTO dto = new OrderDTO();
        dto.setShipperId(shipperId);
        return dto;
    }

    private static Order order(long id, User customer, User shipper, OrderStatus status) {
        Order order = new Order();
        order.setId(id);
        order.setUser(customer);
        order.setShipper(shipper);
        order.setStatus(status);
        return order;
    }

    private static User customer() {
        return user(10L, "CUSTOMER");
    }

    private static User shipper() {
        return user(20L, "SHIPPER");
    }

    private static User manager() {
        return user(30L, "MANAGER");
    }

    private static User systemAdmin() {
        return user(40L, "SYSTEM_ADMIN");
    }

    private static User user(long id, String roleName) {
        User user = new User();
        user.setId(id);
        user.setEmail(roleName.toLowerCase() + "@example.com");
        user.setRole(role(roleName));
        return user;
    }

    private static Role role(String name) {
        Role role = new Role();
        role.setName(name);
        return role;
    }
}