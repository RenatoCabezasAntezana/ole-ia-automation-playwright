@login
Feature: Login

  Como cliente de Sauce Demo,
  Quiero iniciar sesión en la plataforma,
  Para acceder al catálogo de productos y realizar compras.

  Background:
    Given que el cliente se encuentra en la página de inicio de sesión

  @smoke
  Scenario: Acceso exitoso al catálogo de productos
    When ingresa el usuario "usuario_valido" y hace clic en Login
    Then el sistema lo redirige a la página principal de productos con la url "/products"
    And se muestra el título "Products" en la pantalla

  @regression
  Scenario: Intento de acceso con contraseña incorrecta
    When ingresa el usuario "usuario_contrasena_errada" y hace clic en Login
    Then el sistema no permite el ingreso
    And muestra el mensaje de error "Epic sadface: Username and password do not match any user in this service"
    And el cliente permanece en la página de inicio de sesión

  @regression
  Scenario: Intento de acceso con cuenta bloqueada
    When ingresa el usuario "usuario_bloqueado" y hace clic en Login
    Then el sistema deniega el acceso
    And muestra el mensaje de error "Epic sadface: Sorry, this user has been locked out."
    And el cliente permanece en la página de inicio de sesión
