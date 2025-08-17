// authConfig.js
import { PublicClientApplication, InteractionRequiredAuthError } from "@azure/msal-browser";

export const msal = new PublicClientApplication({
  auth: {
    clientId: "0dbfff4f-ac7e-43ed-bf32-0f301c7a896a",
    authority: "https://login.microsoftonline.com/angelsebastianbellomateohot.onmicrosoft.com",
    redirectUri: "http://localhost:5173/",
    postLogoutRedirectUri: "http://localhost:5173/"
  },
  cache: { cacheLocation: "localStorage" }
});

// 👉 Use your API scope (NOT Graph)
const tokenRequest = {
  scopes: ["api://fe1bf2cf-95e5-44c4-b7b9-1c4559373e08/access_as_user"]
};

// Variable para rastrear si MSAL está inicializado
let msalInitialized = false;

// Variable para evitar múltiples interacciones simultáneas
let interactionInProgress = false;

// Función para inicializar MSAL
export async function initializeMsal() {
  if (!msalInitialized) {
    await msal.initialize();
    msalInitialized = true;
  }
}

export async function getToken() {
  // Asegurar que MSAL esté inicializado
  await initializeMsal();
  
  // Evitar múltiples interacciones simultáneas
  if (interactionInProgress) {
    console.log('Interacción en progreso, esperando...');
    return;
  }
  
  // ensure we have an account
  let accounts = msal.getAllAccounts();
  if (accounts.length === 0) {
    interactionInProgress = true;
    try {
      await msal.loginRedirect(tokenRequest); // or loginPopup(tokenRequest)
      return; // browser will redirect; next load handleRedirectPromise continues
    } catch (error) {
      interactionInProgress = false;
      throw error;
    }
  }

  try {
    const res = await msal.acquireTokenSilent({
      ...tokenRequest,
      account: msal.getAllAccounts()[0]
    });
    return res.accessToken;
  } catch (err) {
    if (err instanceof InteractionRequiredAuthError) {
      interactionInProgress = true;
      try {
        await msal.acquireTokenRedirect(tokenRequest); // or acquireTokenPopup
        return;
      } catch (error) {
        interactionInProgress = false;
        throw error;
      }
    }
    throw err;
  }
}

// Función para obtener información del usuario logueado
export function getCurrentUser() {
  const accounts = msal.getAllAccounts();
  if (accounts.length > 0) {
    return accounts[0];
  }
  return null;
}

// Función para verificar si el usuario está logueado
export function isAuthenticated() {
  return msal.getAllAccounts().length > 0;
}

// Función para resetear el flag de interacción
export function resetInteractionFlag() {
  interactionInProgress = false;
}

// Función para manejar la promesa de redirección
export async function handleRedirectPromise() {
  await initializeMsal();
  const response = await msal.handleRedirectPromise();
  
  // Resetear el flag de interacción después de manejar la redirección
  if (response) {
    resetInteractionFlag();
  }
  
  return response;
}

// Función para obtener información del usuario logueado
export function getUserInfo() {
  const accounts = msal.getAllAccounts();
  if (accounts.length > 0) {
    const account = accounts[0];
    return {
      name: account.name || account.username,
      username: account.username,
      homeAccountId: account.homeAccountId,
      environment: account.environment,
      tenantId: account.tenantId,
      localAccountId: account.localAccountId
    };
  }
  return null;
}

// Función para hacer logout
export async function logout() {
  await initializeMsal();
  await msal.logoutRedirect({
    postLogoutRedirectUri: "http://localhost:5173/"
  });
}
