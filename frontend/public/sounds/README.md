# Sound Files

This directory contains notification sound files for the chat application.

## Required Files:

1. **message.mp3** - Played when user sends a message
2. **notification.wav** - Played when user receives a message

## How to Add Sounds:

### Option 1: Download Free Sounds
You can download free notification sounds from:
- https://notificationsounds.com/
- https://mixkit.co/free-sound-effects/notification/
- https://freesound.org/

### Option 2: Use WhatsApp Sounds
If you have WhatsApp installed, you can extract the sounds from:
- **Windows**: `C:\Users\[YourName]\AppData\Local\Packages\5319275A.WhatsAppDesktop_cv1g1gvanyjgm\LocalState\shared\sounds`
- **Android**: `/data/data/com.whatsapp/files/Sounds/`

### Option 3: Create Your Own
Use any audio editing software like Audacity to create short notification sounds.

## File Specifications:

- **message.mp3**: Short, high-pitched sound (0.1-0.3 seconds)
- **notification.wav**: Slightly longer, pleasant notification sound (0.3-0.5 seconds)

## Fallback:

If these files are not found, the app will automatically use generated Web Audio API tones as fallback.
