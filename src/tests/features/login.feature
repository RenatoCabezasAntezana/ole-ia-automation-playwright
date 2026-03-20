@login
Feature: Login en Swag Labs

  Como cliente de SauceDemo,
  Quiero contar con un sistema de acceso seguro,
  Para que solo yo pueda entrar a mi cuenta.

  Background:
    Given que el cliente se encuentra en la página de inicio de sesión de Swag Labs

  @smoke
  Scenario: Acceso exitoso al catálogo de productos
    When ingresa el usuario "usuario_valido" y hace clic en Login
    Then el sistema lo redirige a "/products.html"
    And se muestra el catálogo de productos con el título "Products"

  @regression
  Scenario: Rechazo al ingresar contraseña incorrecta
    When ingresa el usuario "usuario_contrasena_errada" y hace clic en Login
    Then el sistema no permite el ingreso
    And permanece en la página de inicio de sesión
    And se muestra el mensaje de error "Epic sadface: Username and password do not match any user in this service"

  @regression
  Scenario: Rechazo de cuenta bloqueada por el administrador
    When ingresa el usuario "usuario_bloqueado" y hace clic en Login
    Then el sistema deniega el acceso
    And permanece en la página de inicio de sesión
    And se muestra el mensaje de error "Epic sadface: Sorry, this user has been locked out."
