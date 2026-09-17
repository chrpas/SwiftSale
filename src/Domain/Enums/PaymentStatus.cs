namespace SwiftSale.Domain.Enums;

public enum PaymentStatus
{
    Cleared = 1,     // Instant for Cash/GCash/Cleared Checks
    Pending = 2,     // Default for Post-Dated Checks awaiting maturity date
    Dishonored = 3,  // Bounced / NSF
    Cancelled = 4
}
