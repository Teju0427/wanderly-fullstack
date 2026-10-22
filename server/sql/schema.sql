/* =====================================================================
   Wanderly — Azure SQL Database schema (T-SQL)
   Idempotent: safe to run any number of times. Batches are separated
   by GO so it also runs as-is in the Azure Portal Query editor,
   SSMS, Azure Data Studio, or sqlcmd.
   ===================================================================== */

/* ---------------------------- Catalog -------------------------------- */

IF OBJECT_ID(N'dbo.Experiences', N'U') IS NULL
CREATE TABLE dbo.Experiences (
    Id           NVARCHAR(64)   NOT NULL CONSTRAINT PK_Experiences PRIMARY KEY,
    Name         NVARCHAR(120)  NOT NULL,
    Location     NVARCHAR(160)  NOT NULL,
    Category     NVARCHAR(40)   NOT NULL,
    Rating       DECIMAL(2,1)   NOT NULL CONSTRAINT CK_Experiences_Rating CHECK (Rating BETWEEN 0 AND 5),
    Price        INT            NOT NULL CONSTRAINT CK_Experiences_Price CHECK (Price >= 0),
    PriceLabel   NVARCHAR(40)   NOT NULL,
    Duration     NVARCHAR(40)   NULL,
    ImageUrl     NVARCHAR(1000) NOT NULL,
    Description  NVARCHAR(MAX)  NULL,
    SortOrder    INT            NOT NULL CONSTRAINT DF_Experiences_SortOrder DEFAULT 0,
    UpdatedAt    DATETIME2(0)   NOT NULL CONSTRAINT DF_Experiences_UpdatedAt DEFAULT SYSUTCDATETIME()
);
GO

IF OBJECT_ID(N'dbo.Stays', N'U') IS NULL
CREATE TABLE dbo.Stays (
    Id           NVARCHAR(64)   NOT NULL CONSTRAINT PK_Stays PRIMARY KEY,
    Name         NVARCHAR(120)  NOT NULL,
    Location     NVARCHAR(160)  NOT NULL,
    Category     NVARCHAR(40)   NOT NULL,
    Rating       DECIMAL(2,1)   NOT NULL CONSTRAINT CK_Stays_Rating CHECK (Rating BETWEEN 0 AND 5),
    Price        INT            NOT NULL CONSTRAINT CK_Stays_Price CHECK (Price >= 0),
    PriceLabel   NVARCHAR(40)   NOT NULL,
    ImageUrl     NVARCHAR(1000) NOT NULL,
    SortOrder    INT            NOT NULL CONSTRAINT DF_Stays_SortOrder DEFAULT 0,
    UpdatedAt    DATETIME2(0)   NOT NULL CONSTRAINT DF_Stays_UpdatedAt DEFAULT SYSUTCDATETIME()
);
GO

IF OBJECT_ID(N'dbo.StayAmenities', N'U') IS NULL
CREATE TABLE dbo.StayAmenities (
    StayId    NVARCHAR(64)  NOT NULL CONSTRAINT FK_StayAmenities_Stays REFERENCES dbo.Stays(Id) ON DELETE CASCADE,
    Position  SMALLINT      NOT NULL,
    Amenity   NVARCHAR(120) NOT NULL,
    CONSTRAINT PK_StayAmenities PRIMARY KEY (StayId, Position)
);
GO

IF OBJECT_ID(N'dbo.Destinations', N'U') IS NULL
CREATE TABLE dbo.Destinations (
    Id           NVARCHAR(64)   NOT NULL CONSTRAINT PK_Destinations PRIMARY KEY,
    Name         NVARCHAR(120)  NOT NULL,
    Region       NVARCHAR(120)  NOT NULL,
    Code         NVARCHAR(8)    NOT NULL,
    Coords       NVARCHAR(40)   NULL,
    Tagline      NVARCHAR(255)  NULL,
    Metadata     NVARCHAR(255)  NULL,
    Category     NVARCHAR(40)   NOT NULL,
    Rating       DECIMAL(2,1)   NOT NULL CONSTRAINT CK_Destinations_Rating CHECK (Rating BETWEEN 0 AND 5),
    Price        INT            NOT NULL CONSTRAINT CK_Destinations_Price CHECK (Price >= 0),
    PriceLabel   NVARCHAR(40)   NOT NULL,
    Duration     NVARCHAR(40)   NULL,
    ImageUrl     NVARCHAR(1000) NOT NULL,
    Description  NVARCHAR(MAX)  NULL,
    BestTime     NVARCHAR(80)   NULL,
    Budget       NVARCHAR(120)  NULL,
    SortOrder    INT            NOT NULL CONSTRAINT DF_Destinations_SortOrder DEFAULT 0,
    UpdatedAt    DATETIME2(0)   NOT NULL CONSTRAINT DF_Destinations_UpdatedAt DEFAULT SYSUTCDATETIME()
);
GO

IF OBJECT_ID(N'dbo.DestinationGallery', N'U') IS NULL
CREATE TABLE dbo.DestinationGallery (
    DestinationId NVARCHAR(64)   NOT NULL CONSTRAINT FK_DestinationGallery_Destinations REFERENCES dbo.Destinations(Id) ON DELETE CASCADE,
    Position      SMALLINT       NOT NULL,
    ImageUrl      NVARCHAR(1000) NOT NULL,
    CONSTRAINT PK_DestinationGallery PRIMARY KEY (DestinationId, Position)
);
GO

IF OBJECT_ID(N'dbo.DestinationThingsToDo', N'U') IS NULL
CREATE TABLE dbo.DestinationThingsToDo (
    DestinationId NVARCHAR(64)  NOT NULL CONSTRAINT FK_DestinationThingsToDo_Destinations REFERENCES dbo.Destinations(Id) ON DELETE CASCADE,
    Position      SMALLINT      NOT NULL,
    Activity      NVARCHAR(400) NOT NULL,
    CONSTRAINT PK_DestinationThingsToDo PRIMARY KEY (DestinationId, Position)
);
GO

IF OBJECT_ID(N'dbo.DestinationTips', N'U') IS NULL
CREATE TABLE dbo.DestinationTips (
    DestinationId NVARCHAR(64)  NOT NULL CONSTRAINT FK_DestinationTips_Destinations REFERENCES dbo.Destinations(Id) ON DELETE CASCADE,
    Position      SMALLINT      NOT NULL,
    Tip           NVARCHAR(600) NOT NULL,
    CONSTRAINT PK_DestinationTips PRIMARY KEY (DestinationId, Position)
);
GO

/* Many-to-many: which experiences / stays are linked to a destination */
IF OBJECT_ID(N'dbo.DestinationExperiences', N'U') IS NULL
CREATE TABLE dbo.DestinationExperiences (
    DestinationId NVARCHAR(64) NOT NULL CONSTRAINT FK_DestinationExperiences_Destinations REFERENCES dbo.Destinations(Id) ON DELETE CASCADE,
    ExperienceId  NVARCHAR(64) NOT NULL CONSTRAINT FK_DestinationExperiences_Experiences REFERENCES dbo.Experiences(Id) ON DELETE CASCADE,
    Position      SMALLINT     NOT NULL CONSTRAINT DF_DestinationExperiences_Position DEFAULT 0,
    CONSTRAINT PK_DestinationExperiences PRIMARY KEY (DestinationId, ExperienceId)
);
GO

IF OBJECT_ID(N'dbo.DestinationStays', N'U') IS NULL
CREATE TABLE dbo.DestinationStays (
    DestinationId NVARCHAR(64) NOT NULL CONSTRAINT FK_DestinationStays_Destinations REFERENCES dbo.Destinations(Id) ON DELETE CASCADE,
    StayId        NVARCHAR(64) NOT NULL CONSTRAINT FK_DestinationStays_Stays REFERENCES dbo.Stays(Id) ON DELETE CASCADE,
    Position      SMALLINT     NOT NULL CONSTRAINT DF_DestinationStays_Position DEFAULT 0,
    CONSTRAINT PK_DestinationStays PRIMARY KEY (DestinationId, StayId)
);
GO

/* ------------------------- Visitor data ------------------------------ */
/* An anonymous visitor is identified by a UUID generated in the browser. */

IF OBJECT_ID(N'dbo.Visitors', N'U') IS NULL
CREATE TABLE dbo.Visitors (
    Id         UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Visitors PRIMARY KEY,
    CreatedAt  DATETIME2(0)     NOT NULL CONSTRAINT DF_Visitors_CreatedAt DEFAULT SYSUTCDATETIME(),
    LastSeenAt DATETIME2(0)     NOT NULL CONSTRAINT DF_Visitors_LastSeenAt DEFAULT SYSUTCDATETIME()
);
GO

IF OBJECT_ID(N'dbo.WishlistItems', N'U') IS NULL
CREATE TABLE dbo.WishlistItems (
    VisitorId UNIQUEIDENTIFIER NOT NULL CONSTRAINT FK_WishlistItems_Visitors REFERENCES dbo.Visitors(Id) ON DELETE CASCADE,
    ItemId    NVARCHAR(64)     NOT NULL,
    ItemType  NVARCHAR(16)     NOT NULL CONSTRAINT CK_WishlistItems_ItemType CHECK (ItemType IN (N'destination', N'experience', N'stay')),
    CreatedAt DATETIME2(0)     NOT NULL CONSTRAINT DF_WishlistItems_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_WishlistItems PRIMARY KEY (VisitorId, ItemId)
);
GO

IF OBJECT_ID(N'dbo.Trips', N'U') IS NULL
CREATE TABLE dbo.Trips (
    Id            INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Trips PRIMARY KEY,
    VisitorId     UNIQUEIDENTIFIER  NOT NULL CONSTRAINT FK_Trips_Visitors REFERENCES dbo.Visitors(Id) ON DELETE CASCADE,
    DestinationId NVARCHAR(64)      NOT NULL CONSTRAINT FK_Trips_Destinations REFERENCES dbo.Destinations(Id),
    Days          TINYINT           NOT NULL CONSTRAINT CK_Trips_Days CHECK (Days BETWEEN 1 AND 14),
    CreatedAt     DATETIME2(0)      NOT NULL CONSTRAINT DF_Trips_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt     DATETIME2(0)      NOT NULL CONSTRAINT DF_Trips_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_Trips_VisitorId UNIQUE (VisitorId)
);
GO

IF OBJECT_ID(N'dbo.TripActivities', N'U') IS NULL
CREATE TABLE dbo.TripActivities (
    Id           INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_TripActivities PRIMARY KEY,
    TripId       INT               NOT NULL CONSTRAINT FK_TripActivities_Trips REFERENCES dbo.Trips(Id) ON DELETE CASCADE,
    DayNumber    TINYINT           NOT NULL CONSTRAINT CK_TripActivities_Day CHECK (DayNumber BETWEEN 1 AND 14),
    Position     SMALLINT          NOT NULL,
    ExperienceId NVARCHAR(64)      NOT NULL CONSTRAINT FK_TripActivities_Experiences REFERENCES dbo.Experiences(Id),
    CONSTRAINT UQ_TripActivities_Slot UNIQUE (TripId, DayNumber, Position)
);
GO

/* --------------------------- Inbound --------------------------------- */

IF OBJECT_ID(N'dbo.ContactMessages', N'U') IS NULL
CREATE TABLE dbo.ContactMessages (
    Id        INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ContactMessages PRIMARY KEY,
    Name      NVARCHAR(120)     NOT NULL,
    Email     NVARCHAR(254)     NOT NULL,
    Message   NVARCHAR(4000)    NOT NULL,
    VisitorId UNIQUEIDENTIFIER  NULL,
    CreatedAt DATETIME2(0)      NOT NULL CONSTRAINT DF_ContactMessages_CreatedAt DEFAULT SYSUTCDATETIME()
);
GO

IF OBJECT_ID(N'dbo.NewsletterSubscribers', N'U') IS NULL
CREATE TABLE dbo.NewsletterSubscribers (
    Id        INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_NewsletterSubscribers PRIMARY KEY,
    Email     NVARCHAR(254)     NOT NULL CONSTRAINT UQ_NewsletterSubscribers_Email UNIQUE,
    CreatedAt DATETIME2(0)      NOT NULL CONSTRAINT DF_NewsletterSubscribers_CreatedAt DEFAULT SYSUTCDATETIME()
);
GO

/* ---------------------------- Indexes -------------------------------- */

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Destinations_Category' AND object_id = OBJECT_ID(N'dbo.Destinations'))
CREATE INDEX IX_Destinations_Category ON dbo.Destinations(Category) INCLUDE (Rating, Price);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_TripActivities_TripId' AND object_id = OBJECT_ID(N'dbo.TripActivities'))
CREATE INDEX IX_TripActivities_TripId ON dbo.TripActivities(TripId, DayNumber, Position);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ContactMessages_CreatedAt' AND object_id = OBJECT_ID(N'dbo.ContactMessages'))
CREATE INDEX IX_ContactMessages_CreatedAt ON dbo.ContactMessages(CreatedAt DESC);
GO
