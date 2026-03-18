@login
Feature: Login

  Como cliente de SauceDemo,
  Quiero poder iniciar sesión con mis credenciales,
  Para acceder al catálogo de productos.

  Background:
    Given que el cliente se encuentra en la página de inicio de sesión

  @smoke
  Scenario: Acceso exitoso al catálogo
    When ingresa el nombre de usuario "standard_user" y la contraseña "secret_sauce"
    And hace clic en el botón de ingresar
    Then el sistema permite el acceso y muestra la pantalla principal de productos
    And la URL de la página es "/products"

  @regression
  Scenario: Intento de acceso con contraseña incorrecta
    When ingresa el nombre de usuario "standard_user" y una contraseña incorrecta
    And hace clic en el botón de ingresar
    Then el sistema no permite el acceso
    And permanece en la página de inicio de sesión
    And se muestra un mensaje indicando que los datos no coinciden

  @regression
  Scenario: Intento de acceso con cuenta bloqueada
    When intenta ingresar con el usuario "locked_out_user" y su contraseña correcta
    And hace clic en el botón de ingresar
    Then el sistema deniega el acceso
    And permanece en la página de inicio de sesión
    And se muestra un mensaje informando que el usuario ha sido bloqueado
