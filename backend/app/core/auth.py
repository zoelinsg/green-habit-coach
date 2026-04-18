import os
from functools import cached_property
from typing import Any, Dict

import requests
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt
from jose.exceptions import JWTError

load_dotenv()

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
AUTH0_AUDIENCE = os.getenv("AUTH0_AUDIENCE")
ALGORITHMS = ["RS256"]

security = HTTPBearer()


class Auth0JWTBearer:
    def __init__(self):
        if not AUTH0_DOMAIN or not AUTH0_AUDIENCE:
            raise ValueError("AUTH0_DOMAIN or AUTH0_AUDIENCE is not set in environment variables")
        self.domain = AUTH0_DOMAIN
        self.audience = AUTH0_AUDIENCE

    @cached_property
    def jwks(self) -> Dict[str, Any]:
        url = f"https://{self.domain}/.well-known/jwks.json"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()

    def verify_jwt(self, token: str) -> Dict[str, Any]:
        try:
            unverified_header = jwt.get_unverified_header(token)
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token header",
            )

        rsa_key = {}
        for key in self.jwks["keys"]:
            if key["kid"] == unverified_header.get("kid"):
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"],
                }
                break

        if not rsa_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unable to find appropriate key",
            )

        try:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=ALGORITHMS,
                audience=self.audience,
                issuer=f"https://{self.domain}/",
            )
            return payload
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Token validation failed: {str(e)}",
            )

    def __call__(
        self,
        credentials: HTTPAuthorizationCredentials = Depends(security),
    ) -> Dict[str, Any]:
        return self.verify_jwt(credentials.credentials)


require_auth = Auth0JWTBearer()