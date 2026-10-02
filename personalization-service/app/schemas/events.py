from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class InteractionEventSchema(BaseModel):
    userId: str
    eventType: str
    resourceId: Optional[str] = None
    taskId: Optional[str] = None
    skill: Optional[str] = None
    metadata: Dict = {}
    timestamp: Optional[datetime] = None

class EventBatchRequest(BaseModel):
    events: List[InteractionEventSchema]

class EventProcessingResult(BaseModel):
    userId: str
    processedCount: int
    profileAdjustments: Dict
    masteryUpdates: Dict[str, float] = {}
