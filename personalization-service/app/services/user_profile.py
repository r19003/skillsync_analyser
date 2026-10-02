from typing import Dict, Any, Optional
from ..schemas.profile import UserProfileSchema

class UserProfileService:
    def __init__(self):
        # In-memory store for fast state caching (backed by MongoDB via Node backend)
        self._profiles: Dict[str, UserProfileSchema] = {}

    def get_or_create_profile(self, user_id: str, target_role: str = "Software Engineer") -> UserProfileSchema:
        if user_id in self._profiles:
            return self._profiles[user_id]
        
        default_profile = UserProfileSchema(
            userId=user_id,
            targetRole=target_role,
            targetSeniority="Entry-Level",
            weeklyHours=10,
            sessionDurationMinutes=45,
            learningStyles=["Interactive practice", "Projects"] if "software" in target_role.lower() else ["Projects", "Written documentation"],
            budget="Free only",
            preferredLanguage="Python" if "software" in target_role.lower() else "SQL"
        )
        self._profiles[user_id] = default_profile
        return default_profile

    def update_profile(self, user_id: str, updates: Dict[str, Any]) -> UserProfileSchema:
        profile = self.get_or_create_profile(user_id, updates.get("targetRole", "Software Engineer"))
        profile_dict = profile.model_dump()
        for k, v in updates.items():
            if k in profile_dict and v is not None:
                profile_dict[k] = v
        updated = UserProfileSchema(**profile_dict)
        self._profiles[user_id] = updated
        return updated

    def set_cached_profile(self, profile: UserProfileSchema):
        self._profiles[profile.userId] = profile

user_profile_service = UserProfileService()
