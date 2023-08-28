import React, {useEffect, useState} from "react";
import type {JSONSchemaType} from "ajv";
import {
    type CodeContributionPoint,
    getCodeContribution,
    registerCodeContribution,
    useContributions
} from "@/core";
import {Disposable} from '@/util/disposable';
import * as log from '@/util/log';


const LOG = new log.Logger("contrib/views");


export interface View {
    id: string;
    title?: string;
    icon?: string;
}

const viewSchema: JSONSchemaType<View> = {
    type: "object",
    properties: {
        id: {type: "string"},
        title: {type: "string", nullable: true},
        icon: {type: "string", nullable: true},
    },
    required: ["id"],
    additionalProperties: false,
};

const schema: JSONSchemaType<View[]> = {
    type: "array",
    items: viewSchema,
};


/**
 * The "views" contribution point.
 * To register in your app, call {@link registerContributionPoint} with
 * {@link viewsPoint}.
 *
 * @category UI Contributions API
 */
export const viewsPoint: CodeContributionPoint<View[]> = {
    id: "views",
    schema,
    idKey: "id",
    activationEvent: "onView:${id}",
};

export type ViewComponent = React.ComponentType;


export function useViews() {
    return useContributions<View>(viewsPoint.id);
}


export function registerViewComponent(viewId: string, component: ViewComponent): Disposable {
    return registerCodeContribution(viewsPoint.id, viewId, component);
}


export function useViewComponent(viewId: string): ViewComponent | null {
    const [viewComponent, setViewComponent] = useState<ViewComponent | null>(null);
    const [error, setError] = useState<unknown>(null);
    useEffect(() => {
        LOG.debug("Hook 'useViewComponent' is recomputing");

        if (viewComponent === null && error === null) {
            getCodeContribution<ViewComponent>(
                viewsPoint as CodeContributionPoint,  // FIXME!
                viewId
            )
                .then(vc => {
                    setViewComponent(() => vc);
                })
                .catch((e: unknown) => {
                    console.error(e);
                    setError(e);
                });
        }
    }, [viewId, viewComponent, error]);
    return viewComponent;
}
