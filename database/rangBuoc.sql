-- Rang buoc nghiep vu va trigger
PRAGMA foreign_keys = ON;

CREATE TRIGGER IF NOT EXISTS trg_ban_an_suc_chua_hop_le
BEFORE INSERT ON ban_an
WHEN NEW.suc_chua < 1
BEGIN SELECT RAISE(ABORT, 'suc chua phai lon hon 0'); END;

CREATE TRIGGER IF NOT EXISTS trg_mon_an_gia_hop_le
BEFORE INSERT ON mon_an
WHEN NEW.gia_ban < 0
BEGIN SELECT RAISE(ABORT, 'gia ban khong duoc am'); END;

CREATE TRIGGER IF NOT EXISTS trg_tuy_chon_gia_hop_le
BEFORE INSERT ON tuy_chon_mon
WHEN NEW.gia_them < 0
BEGIN SELECT RAISE(ABORT, 'gia them khong duoc am'); END;
