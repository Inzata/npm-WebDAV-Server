import { RequestContext } from '../WebDAVRequest'
import { XMLElement } from '../../../helper/XML'
import { Path } from '../../../manager/v2/Path'
import { Resource } from '../../../manager/v2/fileSystem/Resource'
import { Lock } from '../../../resource/lock/Lock'

export type EventsName = 'create' | 'delete' | 'copy' | 'move'
    | 'lock' | 'refreshLock' | 'unlock'
    | 'setProperty' | 'removeProperty'
    | 'write' | 'read'
    | 'addChild';

export type DetailsType = Resource | Path | Lock | XMLElement;
export type Listener = (ctx : RequestContext, subjectResource : Resource, details ?: DetailsType) => void;

function getEventBag(_this : any, event ?: string)
{
    if(!_this.__events)
        _this.__events = { };

    if(event && !_this.__events[event])
    {
        _this.__events[event] = {
            all: [],
            named: {}
        };
        return _this.__events[event];
    }
    
    return event ? _this.__events[event] : _this.__events;
}

export function invoke(event : EventsName, ctx : RequestContext, subjectResource ?: Resource, details ?: DetailsType)
{
    const events = getEventBag(this, event);
    events.all.forEach((e) => process.nextTick(() => e(ctx, subjectResource, details)));
}

export function register(event : EventsName, listener : Listener)
{
    const events = getEventBag(this, event);
    events.all.push(listener)
}

export function registerWithName(event : EventsName, name : string, listener : Listener)
{
    const events = getEventBag(this, event);
    events.all.push(listener);
    events.named[name] = listener;
}

export function clear(event : EventsName)
{
    const events = getEventBag(this, event);
    events.all = [];
    events.named = {};
}

export function clearAll(event : EventsName)
{
    this.__events = { };
}

export function remove(event : EventsName, listener : Listener)
{
    const events = getEventBag(this, event);
    events.all.indexOf(listener);
}

export function removeByName(event : EventsName, name : string)
{
    const events = getEventBag(this, event);
    const listener = events.named[name];
    if(listener)
    {
        delete events.named[name];
        events.all.splice(events.all.indexOf(listener), 1);
    }
}
